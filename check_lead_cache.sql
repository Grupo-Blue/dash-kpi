SELECT 
  email,
  LENGTH(mauticData) as mautic_size,
  LENGTH(pipedriveData) as pipedrive_size,
  cachedAt,
  expiresAt,
  CASE 
    WHEN expiresAt < NOW() THEN 'EXPIRADO'
    ELSE 'VÁLIDO'
  END as status
FROM leadJourneyCache
WHERE email = 'mychel@blueconsult.com.br';
