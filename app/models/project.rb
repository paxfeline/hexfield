class Project < ApplicationRecord
  after_initialize :default_visibility

  #enum :visibility, [ :vis_private, :vis_public ], default: :vis_private
  belongs_to :owner, class_name: "User"

  def default_visibility
    self.visibility ||= 0
  end
end
