class AddIndexToName < ActiveRecord::Migration[8.0]
  def change
    add_index :users, :name
  end
end
