import { auth } from "../lib/auth"

async function seed() {
  try {
    await auth.api.signUpEmail({
      body: {
        email: "aminata.kone@ba-ci.com",
        password: "demo1234",
        name: "Aminata Koné",
      },
    })
    console.log("✅ Utilisateur créé : aminata.kone@ba-ci.com / demo1234")
  } catch (e) {
    console.log("ℹ️  Utilisateur déjà existant")
  }
  process.exit(0)
}

seed()
