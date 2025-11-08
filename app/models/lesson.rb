class Lesson < ApplicationRecord
  belongs_to :creator, class_name: "Teacher"
  belongs_to :project
  has_and_belongs_to_many :classrooms
end
