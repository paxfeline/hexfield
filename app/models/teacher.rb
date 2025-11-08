class Teacher < User
  has_many :classrooms, foreign_key: "creator_id", inverse_of: :creator
  has_and_belongs_to_many :classrooms, foreign_key: "user_id"
  has_many :lessons
end
