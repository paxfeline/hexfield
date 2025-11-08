class DashboardsController < ApplicationController
  before_action :set_user

  def dashboard
    @projects = current_user&.projects
    @classrooms = current_user&.classrooms
  end

  private

  def set_user
    @user = current_user
    @user_signed_in = user_signed_in?
  end
end
