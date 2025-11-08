class Classroom < ApplicationRecord
  belongs_to :creator, class_name: "Teacher"
  has_many :teachers
end
