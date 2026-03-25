export const formatMessageDateTime = (dateString) => {
  if (!dateString) return 'now';

  const messageDate = new Date(dateString);
  const today = new Date();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const time = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (messageDate.toDateString() === today.toDateString()) {
    return time;
  }

  if (messageDate.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${time}`;
  }

  const dateOptions = { day: '2-digit', month: 'short' };
  const shortDate = messageDate.toLocaleDateString('ro-RO', dateOptions);

  return `${shortDate}, ${time}`;
};

export const getBorderColorByType = (item) => {
  switch (item.type) {
    case 'Emergency':
      return 'border-red-500';
    case 'Skill':
      return 'border-blue-500';
    case 'Item':
      return 'border-green-500';
    default:
      return 'border-gray-500';
  }
};

export const getTypeBadgeColor = (item) => {
  switch (item.type) {
    case 'Emergency':
      return 'bg-red-500';
    case 'Skill':
      return 'bg-blue-500';
    case 'Item':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

export const getIconName = (item) => {
  switch (item.type) {
    case 'Emergency':
      return 'flame-outline';
    case 'Skill':
      return 'construct';
    case 'Item':
      return 'cube';
    default:
      return 'help-circle';
  }
};
