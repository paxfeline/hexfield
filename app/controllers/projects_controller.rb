class ProjectsController < ApplicationController
  before_action :set_project, only: %i[ show edit destroy ]
  before_action :set_visibility_enum, only: %i[ create ]

  # GET /projects or /projects.json
  def index
    @projects = current_user.projects
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
    puts params.inspect
    @project = Project.find_by(name: params[:id])
    params[:project][:owner_id] = current_user.id
    params[:project][:name] = params[:id]
    set_visibility_enum
    puts params.inspect
    respond_to do |format|
      if @project.update(project_params)
        #format.html { redirect_to @project, notice: "Project was successfully updated." }
        #format.json { render :show, status: :ok, location: @project }
        return render json: { status: :ok, location: @project }
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
    if params[:project][:visibility] == "1"
      params[:project][:visibility] = :vis_public
    else
      params[:project][:visibility] = :vis_private
    end
  end
end
