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
  console.log(shortDate);

  return `${shortDate}, ${time}`;
};
