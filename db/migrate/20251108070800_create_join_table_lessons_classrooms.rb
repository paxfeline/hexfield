class CreateJoinTableLessonsClassrooms < ActiveRecord::Migration[8.0]
  def change
    create_join_table :lessons, :classrooms do |t|
      # t.index [:lesson_id, :classroom_id]
      # t.index [:classroom_id, :lesson_id]
    end
  end
end
