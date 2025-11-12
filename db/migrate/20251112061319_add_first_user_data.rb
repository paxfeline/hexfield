class AddFirstUserData < ActiveRecord::Migration[8.0]
  def change
    hex_user = User.create(name: "Hex", password: "qwerty", email: "hex@hexfield")
    default_project = Project.create(name: "default", visibility: 1, owner: hex_user)
  end
end
