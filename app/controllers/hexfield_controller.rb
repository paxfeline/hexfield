class HexfieldController < ApplicationController
  before_action :set_user

  require "google/cloud/storage"

  def index
  end

  def edit
  end

  # get "api/get-project" => "hexfield#get_project"
  def get_project
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
    storage = Google::Cloud::Storage.new
    bucket  = storage.bucket hexfield_bucket
    files   = bucket.files prefix: "#{current_user.id}/#{params[:project][:name]}/"
    render json: files.map(&:name)
  end

  # get "api/get-media-files" => "hexfield#get_media_files"
  def get_media_files
    storage = Google::Cloud::Storage.new
    bucket  = storage.bucket hexfield_bucket
    files   = bucket.files prefix: "#{current_user.id}/#{params[:project][:name]}/media/"
    render json: files.map(&:name)
  end

  # post "api/upload-code-file" => "hexfield#upload_code_file"
  def upload_code_file
    storage = Google::Cloud::Storage.new
    bucket  = storage.bucket hexfield_bucket

    upfile = params[:code_file]
    name = upfile.original_filename
    userid = current_user.id
    project = params[:project][:name]
    file_name = "#{userid}/#{project}/#{name}"

    file = bucket.create_file upfile.path, file_name
    puts "Uploaded #{upfile.path} as #{file.name} in bucket hexfield"

    render json: { filename: name }
  end

  # post "api/upload-media-file" => "hexfield#upload_media_file"
  def upload_media_file
    storage = Google::Cloud::Storage.new
    bucket  = storage.bucket hexfield_bucket

    upfile = params[:code_file]
    name = upfile.original_filename
    userid = current_user.id
    project = params[:project][:name]
    file_name = "#{userid}/#{project}/media/#{name}"

    file = bucket.create_file upfile.path, file_name
    puts "Uploaded #{upfile.path} as #{file.name} in bucket hexfield"

    render json: { filename: "/media/#{name}" }
  end

  def private_get_code_file
    storage = Google::Cloud::Storage.new
    bucket  = storage.bucket hexfield_bucket

    #debugger

    name = params[:file_name]
    userid = current_user.id
    project = params[:project][:name]
    file_name = "#{userid}/#{project}/#{name}"

    file = bucket.file file_name

    downloaded = file.download
    #downloaded.rewind # Optional - not needed on first read
    contents = downloaded.read

    puts "Contents of storage object #{file.name} in bucket #{hexfield_bucket} are: #{contents}"

    render json: { body: contents }
  end

  private

  def set_user
    @user = current_user
    @user_signed_in = user_signed_in?
  end

  def hexfield_bucket
    "hexfield"
  end
end
