class AddCloneableToLessons < ActiveRecord::Migration[8.0]
  def change
    add_column :lessons, :cloneable, :integer, default: 0
  end
end
