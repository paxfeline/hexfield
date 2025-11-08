class Classroom < ApplicationRecord
  belongs_to :creator, class_name: "Teacher", inverse_of: :classrooms
  has_many :teachers
end
