class UpdateLogoToDigitalTolk < ActiveRecord::Migration[7.0]
  def up
    logodark = InstallationConfig.find_by(name: 'LOGO_DARK')
    logothumb = InstallationConfig.find_by(name: 'LOGO_THUMBNAIL')
    logo = InstallationConfig.find_by(name: 'LOGO_DARK')
    
    if logodark.present?
      logodark.update(serialized_value: {"value"=>"/brand-assets/logo_dark.png"}.with_indifferent_access)
    end

    if logo.present?
      logo.update(serialized_value: {"value"=>"/brand-assets/logo.png"}.with_indifferent_access)
    end

    if logothumb.present?
      logothumb.update(serialized_value: {"value"=>"/brand-assets/logo_thumbnail.png"}.with_indifferent_access)
    end 
  end
end