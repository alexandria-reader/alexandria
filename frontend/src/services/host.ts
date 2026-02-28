export default import.meta.env.DEV ||
import.meta.env.VITE_CONTEXT === 'deploy-preview'
  ? import.meta.env.VITE_DEV_DB
  : import.meta.env.VITE_PROD_DB;
