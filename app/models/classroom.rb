class Classroom < ApplicationRecord
  belongs_to :creator, class_name: "Teacher", inverse_of: :classrooms
  has_and_belongs_to_many :teachers, class_name: "User"
  has_and_belongs_to_many :lessons
end
