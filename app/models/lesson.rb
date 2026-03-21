class Lesson < ApplicationRecord
  belongs_to :creator, class_name: "Teacher", foreign_key: "creator_id"
  belongs_to :project
  has_and_belongs_to_many :classrooms
end
