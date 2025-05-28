class HexfieldController < ApplicationController
  before_action :set_user

  def index
  end
  
  def hexfield
    puts ""
  end
  
  private
  
  def set_user
    @user = current_user
    @user_signed_in = user_signed_in?
  end

end
