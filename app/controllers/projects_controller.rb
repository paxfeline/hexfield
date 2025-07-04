class ProjectsController < ApplicationController
  before_action :set_project, only: %i[ show edit update destroy ]
  before_action :set_visibility_enum, only: %i[ create update ]

  # GET /projects or /projects.json
  def index
    @projects = Project.all
  end

  # GET /projects/1 or /projects/1.json
  def show
  end

  # GET /projects/new
  def new
    @project = Project.new
    @user = current_user
  end

  # GET /projects/1/edit
  def edit
  end

  # POST /projects or /projects.json
  def create
    render plain: 'no', status: :unauthorized and return unless user_signed_in?

    params[:project][:owner_id] = current_user.id

    @project = Project.new(project_params)

    respond_to do |format|
      if @project.save
        format.html { redirect_to @project, notice: "Project was successfully created." }
        format.json { render :show, status: :created, location: @project }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @project.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /projects/1 or /projects/1.json
  def update
    respond_to do |format|
      if @project.update(project_params)
        format.html { redirect_to @project, notice: "Project was successfully updated." }
        format.json { render :show, status: :ok, location: @project }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @project.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /projects/1 or /projects/1.json
  def destroy
    @project.destroy!

    respond_to do |format|
      format.html { redirect_to projects_path, status: :see_other, notice: "Project was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_project
    @project = Project.find(params.expect(:id))
  end

  # Only allow a list of trusted parameters through.
  def project_params
    params.expect(project: [ :owner_id, :name, :visibility ])
  end

  # Turn visibility into a numbers
  def set_visibility_enum
    params[:project][:visibility] = params[:project][:visibility] == "1" ?
      :vis_public :
      :vis_private
  end
end
