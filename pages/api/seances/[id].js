import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const seance = await prisma.seance.findUnique({
        where: { id },
      });
      if (!seance) {
        return res.status(404).json({ error: "Séance introuvable" });
      }
      return res.status(200).json(seance);
    } catch (error) {
      console.error('Erreur GET:', error);
      return res.status(500).json({ error: "Erreur lors de la récupération de la séance" });
    }
  }

  if (req.method === 'PATCH') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body); // ✅ blindage pour Next.js bodyParser
      } catch (err) {
        console.error('Erreur de parsing JSON:', err);
        return res.status(400).json({ error: "Body invalide" });
      }
    }

    const { position, semaine, objectif, subtitle, consigne, detailed } = body;

    const data = {};
    if (position !== undefined) data.position = position;

    if (semaine !== undefined) {
      if (semaine === null) {
        data.semaine = null; // ✅ on réinitialise proprement
      } else {
        data.semaine = new Date(semaine); // ✅ convertit en Date
      }
    }

    if (objectif !== undefined) data.objectif = objectif;
    if (subtitle !== undefined) data.subtitle = subtitle;
    if (consigne !== undefined) data.consigne = consigne;
    if (detailed !== undefined) data.detailed = detailed;

    console.log("✅ PATCH reçu : ", data);

    try {
      const updated = await prisma.seance.update({
        where: { id },
        data: data,
      });
      return res.status(200).json(updated);
    } catch (error) {
      console.error('Erreur PATCH:', error);
      return res.status(500).json({ error: "Erreur de mise à jour de la séance" });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.seance.delete({
        where: { id },
      });
      return res.status(204).end();
    } catch (error) {
      console.error('Erreur DELETE:', error);
      return res.status(500).json({ error: "Erreur lors de la suppression" });
    }
  }

  res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
  res.status(405).end(`Méthode ${req.method} non autorisée`);
}
