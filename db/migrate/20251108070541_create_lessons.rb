class CreateLessons < ActiveRecord::Migration[8.0]
  def change
    create_table :lessons do |t|
      t.string :name
      t.references :creator, null: false, foreign_key: {to_table: :users}
      t.references :project, null: false, foreign_key: true

      t.timestamps
    end
  end
end
