export const getMugshot = (id) => {
  if (id) return Meteor.users.findOne({ _id: id }).mugshot;
};
