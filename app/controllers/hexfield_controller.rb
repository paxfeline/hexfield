class HexfieldController < ApplicationController
  before_action :set_user

  require "google/cloud/storage"

  def index
  end
  
  def edit
  end

  # get "api/get-files" => "hexfield#get_files"
  def get_files
    storage = Google::Cloud::Storage.new
    bucket  = storage.bucket "hexfield"
    files   = bucket.files prefix: "#{current_user.id}/"
    render json: files.map(&:name) # { |f| f.name }
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
