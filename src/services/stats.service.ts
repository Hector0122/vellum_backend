import { prisma } from '../lib/db';

export async function createSession(
  userId: string,
  bookId: string,
  startedAt: string,
) {
  return prisma.readingSession.create({
    data: {
      userId,
      bookId,
      startedAt: new Date(startedAt),
    },
  });
}

export async function endSession(
  userId: string,
  sessionId: string,
  endedAt: string,
  wordsRead: number,
) {
  const session = await prisma.readingSession.findFirst({
    where: { id: sessionId, userId },
  });

  if (!session) return null;

  const ended = new Date(endedAt);
  const durationSeconds = Math.round(
    (ended.getTime() - session.startedAt.getTime()) / 1000,
  );

  if (durationSeconds < 300) {
    await prisma.readingSession.delete({ where: { id: sessionId } });
    return null;
  }

  return prisma.readingSession.update({
    where: { id: sessionId },
    data: {
      endedAt: ended,
      durationSeconds,
      wordsRead,
    },
  });
}

export async function getStreak(userId: string) {
  const sessions = await prisma.readingSession.findMany({
    where: {
      userId,
      startedAt: { gte: new Date(Date.now() - 365 * 86400000) },
    },
    orderBy: { startedAt: 'desc' },
    select: { startedAt: true, durationSeconds: true },
  });

  const validDays = new Set<string>();
  for (const s of sessions) {
    if (s.durationSeconds >= 300) {
      const date = s.startedAt.toISOString().slice(0, 10);
      validDays.add(date);
    }
  }

  const sortedDays = Array.from(validDays).sort().reverse();

  let currentStreak = 0;
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const hasToday = validDays.has(today);
  const hasYesterday = validDays.has(yesterday);

  if (hasToday || hasYesterday) {
    const check = new Date(hasToday ? today : yesterday);
    while (true) {
      const iso = check.toISOString().slice(0, 10);
      if (validDays.has(iso)) {
        currentStreak++;
        check.setDate(check.getDate() - 1);
      } else {
        break;
      }
    }
  }

  const todayMinutes = sessions
    .filter((s: { startedAt: Date; durationSeconds: number }) => s.startedAt.toISOString().slice(0, 10) === today)
    .reduce((sum: number, s: { durationSeconds: number }) => sum + s.durationSeconds, 0) / 60;

  const totalMinutes = sessions.reduce(
    (sum: number, s: { durationSeconds: number }) => sum + s.durationSeconds,
    0,
  ) / 60;

  return {
    currentStreak,
    todayMinutes: Math.round(todayMinutes),
    totalMinutes: Math.round(totalMinutes),
  };
}
