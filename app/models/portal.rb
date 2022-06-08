# == Schema Information
#
# Table name: portals
#
#  id            :bigint           not null, primary key
#  archived      :boolean          default(FALSE)
#  color         :string
#  config        :jsonb
#  custom_domain :string
#  header_text   :text
#  homepage_link :string
#  name          :string           not null
#  page_title    :string
#  slug          :string           not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  account_id    :integer          not null
#
# Indexes
#
#  index_portals_on_slug  (slug) UNIQUE
#
class Portal < ApplicationRecord
  belongs_to :account
  has_many :categories, dependent: :destroy_async
  has_many :folders,  through: :categories
  has_many :articles, dependent: :destroy_async
  has_and_belongs_to_many :members, class_name: 'User', foreign_key: :user_id, join_table: 'portals_members'

  validates :account_id, presence: true
  validates :name, presence: true
  validates :slug, presence: true, uniqueness: true
end
