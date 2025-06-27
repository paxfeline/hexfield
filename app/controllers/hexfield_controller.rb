class HexfieldController < ApplicationController
  before_action :set_user

  require "google/cloud/storage"
  require 'tempfile'

  def index
  end

  def edit
  end

  # get "api/get-project" => "hexfield#get_project"
  def get_project
    #sleep 5
    project = Project.find_by(name: params[:project][:name])
    if project.nil?
      render plain: "Project not found", status: :not_found and return
    else
      if project.owner == current_user
        render json: {project: project, user: current_user.id}
      else
        render plain: "Not authorized as owner of project", status: :forbidden
      end
    end
  end

  # get "api/get-code-files" => "hexfield#get_code_files"
  def get_code_files
    puts params.inspect
    bucket = get_bucket
    files = bucket.files prefix: "#{@user.id}/#{params[:project][:name]}/", delimiter: "/"
    render json: files.map(&:name)
  end
  
  # get "api/get-media-files" => "hexfield#get_media_files"
  def get_media_files
    puts params.inspect
    bucket = get_bucket
    files = bucket.files prefix: "#{@user.id}/#{params[:project][:name]}/media/", delimiter: "/"
    render json: files.map(&:name)
  end

  # post "api/upload-code-file" => "hexfield#upload_code_file"
  def upload_code_file
    bucket = get_bucket

    upfiles = params[:code_file]

    upfiles.each do |upfile|
      name = upfile.original_filename
      userid = current_user.id
      project = params[:project][:name]
      file_name = "#{userid}/#{project}/#{name}"

      file = bucket.create_file upfile.path, file_name

      puts "Uploaded #{upfile.path} as #{file.name} in bucket hexfield"
    end

    render plain: "code files uploaded"
  end

  # post "api/upload-media-file" => "hexfield#upload_media_file"
  def upload_media_file
    bucket = get_bucket

    upfiles = params[:media_file]

    upfiles.each do |upfile|
      name = upfile.original_filename
      userid = current_user.id
      project = params[:project][:name]
      file_name = "#{userid}/#{project}/media/#{name}"

      file = bucket.create_file upfile.path, file_name

      puts "Uploaded #{upfile.path} as #{file.name} in bucket hexfield"
    end

    render plain: "media files uploaded"
  end

  def private_get_code_file
    bucket = get_bucket

    name = params[:file_name]
    userid = current_user.id
    project = params[:project][:name]
    file_name = "#{userid}/#{project}/#{name}"

    file = bucket.file file_name

    downloaded = file.download
    contents = downloaded.read

    puts "Contents of storage object #{file.name} in bucket #{hexfield_bucket} are: #{contents}"

    render json: { body: contents }
  end

  def public_get_code_file
    project_name = params[:project]
    project = Project.find_by(name: project_name)

    render plain: "Project is not public", status: :unauthorized and return unless project.vis_public?

    bucket = get_bucket

    file_name = params[:file]
    frmt = params[:format]
    userid = params[:user]
    file_path = "#{userid}/#{project_name}/#{file_name}.#{frmt}"

    file = bucket.file file_path

    render plain: "File not found", status: :not_found and return unless file.present?

    local_file = Tempfile.new(file_name)
    local_file.close

    # download contents to tempfile path
    file.download local_file.path

    render file: local_file.path, content_type: file.content_type

    local_file.unlink # delete tempfile file
  end

  def public_get_media_file
    project_name = params[:project]
    project = Project.find_by(name: project_name)

    render plain: "Project is not public", status: :unauthorized and return unless project.vis_public?

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
