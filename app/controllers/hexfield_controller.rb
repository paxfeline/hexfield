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
        render json: project
      else
        render plain: "Not authorized as owner of project", status: :forbidden
      end
    end
  end

  # get "api/get-code-files" => "hexfield#get_code_files"
  def get_code_files
    storage = Google::Cloud::Storage.new
    bucket  = storage.bucket "hexfield"
    files   = bucket.files prefix: "#{current_user.id}/#{params[:project][:name]}", delimiter: "/"
    render json: files.map(&:name)
  end

  # get "api/get-media-files" => "hexfield#get_media_files"
  def get_media_files
    storage = Google::Cloud::Storage.new
    bucket  = storage.bucket "hexfield"
    files   = bucket.files prefix: "#{current_user.id}/#{params[:project][:name]}/media", delimiter: "/"
    render json: files.map(&:name)
  end

  # post "api/upload-code-file" => "hexfield#upload_code_file"
  def upload_code_file
  end

  # post "api/upload-media-file" => "hexfield#upload_media_file"
  def upload_media_file
  end

  private

  def set_user
    @user = current_user
    @user_signed_in = user_signed_in?
  end
end
