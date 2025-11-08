class Teacher < User
  has_many :classrooms, foreign_key: "creator_id", inverse_of: :creator
end
