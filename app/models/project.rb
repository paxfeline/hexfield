class Project < ApplicationRecord
  enum visibility: { female: 'fem', male: 'mal' }
  belongs_to :owner
end
