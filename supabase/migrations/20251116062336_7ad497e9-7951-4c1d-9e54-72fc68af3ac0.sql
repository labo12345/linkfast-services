-- Add missing columns to properties
ALTER TABLE public.properties ADD COLUMN latitude DOUBLE PRECISION;
ALTER TABLE public.properties ADD COLUMN longitude DOUBLE PRECISION;

-- Add missing column to rides
ALTER TABLE public.rides ADD COLUMN pickup_address TEXT;