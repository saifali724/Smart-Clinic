// src/features/idScanner/services/queueService.js

export const PRIORITY_LEVELS = {
  CRITICAL: "Critical",
  URGENT: "Urgent",
  NORMAL: "Normal Schedule",
};

const PRIORITY_RANK = {
  [PRIORITY_LEVELS.CRITICAL]: 0,
  [PRIORITY_LEVELS.URGENT]: 1,
  [PRIORITY_LEVELS.NORMAL]: 2,
};

export function getPriorityRank(priority) {
  return PRIORITY_RANK[priority] ?? Object.keys(PRIORITY_RANK).length;
}

export function sortQueueByPriority(queue) {
  return [...queue].sort((a, b) => {
    const rankDifference =
      getPriorityRank(a.priority) - getPriorityRank(b.priority);
    if (rankDifference !== 0) return rankDifference;
    return (a.sequence ?? 0) - (b.sequence ?? 0);
  });
}

export function getNextSequence(queue) {
  return queue.reduce((max, entry) => Math.max(max, entry.sequence ?? 0), 0) + 1;
}

const PATIENT_ID_BASE = 2846;

export function createQueueEntry({ sequence, priority }) {
  return {
    id: `#PT-${PATIENT_ID_BASE + sequence}`,
    sequence,
    token: `Patient ${sequence}`,
    initials: `P${sequence}`,
    priority,
    time: "Checked in just now",
    status: "Waiting",
  };
}

export function addPatientToQueue(queue, priority = PRIORITY_LEVELS.NORMAL) {
  const entry = createQueueEntry({
    sequence: getNextSequence(queue),
    priority,
  });
  return sortQueueByPriority([...queue, entry]);
}