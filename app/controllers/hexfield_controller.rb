class HexfieldController < ApplicationController
  def index
    @user = current_user
    @user_signed_in = user_signed_in?
  end
end
