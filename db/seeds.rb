# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

default_teacher = Teacher.new
default_teacher.name = "Hexfield Teacher"
default_teacher.email = "teacher@hex.field"
default_teacher.save(validate: false)

default_project = Project.new
default_project.owner = default_teacher
default_project.name = "default-project"
default_project.visibility = 1
default_project.save

default_lesson = Lesson.new
default_lesson.name = "default-lesson"
default_lesson.project = default_project
default_lesson.creator = default_teacher
default_lesson.cloneable = 1
default_lesson.save
