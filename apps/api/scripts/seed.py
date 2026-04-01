"""
Script de seed — insère une institution et un utilisateur admin de test
Usage : docker compose exec api python scripts/seed.py
"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
import bcrypt
from app.core.config import settings

async def seed():
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Vérifier si les données existent déjà
        result = await session.execute(
            text("SELECT COUNT(*) FROM institutions")
        )
        count = result.scalar()

        if count > 0:
            print("✅ Données de seed déjà présentes — rien à faire")
            return

        # Créer l'institution pilote
        await session.execute(text("""
            INSERT INTO institutions (nom, email_admin, pays, abonnement_statut)
            VALUES ('Banque Pilote CI', 'admin@banque-pilote.ci', 'Côte d''Ivoire', 'trial')
        """))

        # Récupérer l'ID de l'institution
        result = await session.execute(text("""
            SELECT id FROM institutions WHERE email_admin = 'admin@banque-pilote.ci'
        """))
        institution_id = result.scalar()

        # Hasher le mot de passe
        password = "demo1234"
        salt = bcrypt.gensalt()
        password_hash = bcrypt.hashpw(password.encode(), salt).decode()

        # Créer l'utilisateur admin
        await session.execute(text(f"""
            INSERT INTO users (institution_id, nom, email, role, password_hash)
            VALUES ('{institution_id}', 'Aminata Koné', 'aminata.kone@ba-ci.com', 'admin', '{password_hash}')
        """))

        await session.commit()
        print("✅ Seed terminé !")
        print("   Email    : aminata.kone@ba-ci.com")
        print("   Password : demo1234")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed())
