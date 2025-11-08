class Student < User
  belongs_to :creator, class_name: "Teacher"
end
