class Project < ApplicationRecord
  enum :visibility, [ :vis_private, :vis_public, :vis_unlisted ], default: :vis_private
  belongs_to :owner, class_name: "User"
end
