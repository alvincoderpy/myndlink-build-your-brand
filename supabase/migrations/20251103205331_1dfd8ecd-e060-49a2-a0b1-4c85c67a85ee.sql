-- Add template_config column to stores table
ALTER TABLE stores 
ADD COLUMN template_config jsonb DEFAULT NULL;

COMMENT ON COLUMN stores.template_config IS 'Custom template configuration including colors, layout, fonts, and card styles';