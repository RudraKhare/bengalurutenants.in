import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

# Connect to database
conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cursor = conn.cursor()

# Check current enum values
cursor.execute("""
SELECT enumlabel 
FROM pg_enum e 
JOIN pg_type t ON e.enumtypid = t.oid 
WHERE t.typname = 'propertytype' 
ORDER BY enumsortorder;
""")

values = cursor.fetchall()
print('Current propertytype enum values in database:')
for val in values:
    print(f'  - {val[0]}')

cursor.close()
conn.close()
