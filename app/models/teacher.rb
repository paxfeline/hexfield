class Teacher < User
  has_many :classrooms, foreign_key: "creator_id"
end
