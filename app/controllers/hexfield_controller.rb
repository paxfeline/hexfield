class HexfieldController < ApplicationController
  before_action :set_user

  require "google/cloud/storage"
  require "google/cloud/storage/control"
  require "google/cloud/storage/control/v2"
  require 'tempfile'

  def index
  end

  def edit
  end

  # get "api/get-project" => "hexfield#get_project"
  def get_project
    #sleep 5
    project = Project.find_by(name: params[:project][:name], owner_id: params[:project][:owner_id])
    if project.nil?
      render plain: "Project not found", status: :not_found and return
    else
      if project.owner == current_user
        render json: { project: project, user: current_user.id }
      else
        render plain: "Not authorized as owner of project", status: :forbidden
      end
    end
  end

  # get "api/get-all-files" => "hexfield#get_all_files"
  def get_all_files
    puts "get all files"
    puts params.inspect
    bucket = get_bucket
    project_path = "#{@user.id}/#{params[:project][:name]}/"
    project_folder = bucket.file project_path
    if project_folder.nil?
      lesson_template = Lesson.find(params[:project][:lesson_template])
      project_path = "#{lesson_template.creator.id}/#{lesson_template.project.name}/"
      p project_path
    end
    file_names = get_folder bucket, project_path
    render json: file_names
  end
  
  def get_folder(bucket, folder)
    files = bucket.files prefix: folder, delimiter: "/", include_folders_as_prefixes: true
    folders = files.prefixes.map do |folder|
      p folder
      get_folder bucket, folder
    end
    { path: folder, items: files.map { |f| file_info(f) }, folders: folders }
  end

  def file_info(file)
    # [file.name, file.content_type, file.updated_at]
    puts file
    { name: file.name }
  end

  # get "api/get-code-files" => "hexfield#get_code_files"
  # def get_code_files
  #   puts params.inspect
  #   bucket = get_bucket
  #   files = bucket.files prefix: "#{@user.id}/#{params[:project][:name]}/", delimiter: "/"
  #   render json: files.map(&:name)
  # end
  
  # get "api/get-media-files" => "hexfield#get_media_files"
  # def get_media_files
  #   puts params.inspect
  #   bucket = get_bucket
  #   files = bucket.files prefix: "#{@user.id}/#{params[:project][:name]}/media/", delimiter: "/"
  #   render json: files.map(&:name)
  # end

  # post "api/create-folder" => "hexfield#create_folder"
  def create_folder
    bucket = get_bucket

    path_prefix = params[:path_prefix]
    folder_name = params[:folder_name]

    storage_control = Google::Cloud::Storage::Control.storage_control
    bucket_path = storage_control.bucket_path project: "_", bucket: "hexfield"
    request = Google::Cloud::Storage::Control::V2::CreateFolderRequest.new parent: bucket_path, folder_id: "3/qwert/f2-test/inner2/"
    response = storage_control.create_folder request
    #debugger()
    
  end

  # post "api/upload-code-file" => "hexfield#upload_code_file"
  def upload_code_file
    bucket = get_bucket

    upfiles = params[:code_file]

    ret = Array.new

    upfiles.each do |upfile|
      name = upfile.original_filename
      userid = current_user.id
      project = params[:project][:name]
      file_name = "#{userid}/#{project}/#{name}"

      ret.push file_name

      file = bucket.create_file upfile.path, file_name

      puts "Uploaded #{upfile.path} as #{file.name} in bucket hexfield"
    end

    render json: { uploaded: ret }
  end
  
  # post "api/upload-media-file" => "hexfield#upload_media_file"
  def upload_media_file
    bucket = get_bucket
    
    upfiles = params[:media_file]
    
    ret = Array.new
    
    upfiles.each do |upfile|
      name = upfile.original_filename
      userid = current_user.id
      project = params[:project][:name]
      file_name = "#{userid}/#{project}/media/#{name}"
      
      ret.push file_name
      
      file = bucket.create_file upfile.path, file_name
      
      puts "Uploaded #{upfile.path} as #{file.name} in bucket hexfield"
    end
    
    render json: { uploaded: ret }
  end

  def private_get_code_file
    bucket = get_bucket

    # changed so all that's needed is name (path)
    file_name = params[:file_name]
    target_user = params[:project][:owner_id]
    userid = current_user.id

    puts "target user #{target_user}"
    puts "userid #{userid}"

    if target_user.to_i != userid
      render plain: "You do not appear to own this file", status: :unauthorized and return
    end

    # file_name = "#{userid}/#{project}/#{name}"

    bucket_file = bucket.file file_name

    local_file = bucket_file.download
    contents = local_file.read

    puts "Contents of storage object #{bucket_file.name} in bucket #{hexfield_bucket} are:\n#{contents}"

    render json: { body: contents }
  end

  # TODO remove other methods; this is it
  def get_file

    puts params

    if params.has_key?(:format)
      file_path = "#{params[:file_name]}.#{params[:format]}"
    else
      file_path = params[:file_name]
    end

    puts "path: " + file_path
    m = /(?<user>.*?)\/(?<project>.*?)\/.*/.match(file_path)

    puts m

    render plain: "Bad request", status: :bad_request and return if m.nil?
    
    pathuser = m.named_captures["user"]
    
    userid = current_user.id
    # render plain: "Unauthorized", status: :unauthorized and return if pathuser.to_i != userid
    
    project_name = m.named_captures["project"]
    # project_name = params[:project][:name]
    project = Project.find_by(name: project_name, owner_id: pathuser)
    
    # puts "pgcf: #{current_user&.id} ? #{userid}"
    
    render plain: "Project not found", status: :unauthorized and return if project.nil?

    lessons = Lesson.where(project: project)
    teacher_override = lessons.any? { |lesson| lesson.creator.email == "teacher@hex.field" }

    # is this too ugly to stay?
    if project.visibility != 1 && (current_user.nil? || current_user != project.owner)
      render plain: "Unauthorized", status: :unauthorized and return unless teacher_override
    end

    bucket = get_bucket

    # file_name = params[:file]
    # frmt = params[:format]
    #file_path = "#{userid}/#{project_name}/#{file_name}#{".#{frmt}" if frmt}"

    puts "File path: #{file_path}"

    file = bucket.file file_path

    render plain: "File not found", status: :not_found and return unless file.present?

    local_file = Tempfile.new("temp_bucket_file")
    local_file.close

    # download contents to tempfile path
    file.download local_file.path

    render file: local_file.path, content_type: file.content_type

    local_file.unlink # delete tempfile file
  end

  def public_get_media_file
    project_name = params[:project]
    project = Project.find_by(name: project_name, owner_id: userid)

    if project.nil? || (project.visibility != 1 && (current_user.nil? || current_user != project.owner))
      render plain: "Project is not public", status: :unauthorized and return
    end

    bucket = get_bucket

    file_name = params[:file]
    frmt = params[:format]
    userid = params[:user]
    file_path = "#{userid}/#{project_name}/media/#{file_name}.#{frmt}"

    file = bucket.file file_path

    render plain: "File not found", status: :not_found and return unless file.present?

    local_file = Tempfile.new(file_name)
    local_file.close

    # download contents to tempfile path
    file.download local_file.path

    render file: local_file.path, content_type: file.content_type

    local_file.unlink # delete tempfile file
  end

  private

  def set_user
    @user = current_user
    @user_signed_in = user_signed_in?
  end

  def hexfield_bucket
    "hexfield"
  end

  def get_bucket
    storage = Google::Cloud::Storage.new
    return storage.bucket hexfield_bucket
  end
end
