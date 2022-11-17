export default {
  methods: {
    getDropdownValues(type) {
      switch (type) {
        case 'assign_team':
          return [
            {
              account_id: 0,
              allow_auto_assign: true,
              description: 'None',
              id: 0,
              is_member: false,
              name: 'None',
            },
            ...this.teams,
          ];
        case 'send_email_to_team':
          return this.teams;
        case 'assign_agent':
          return this.agents;
        case 'add_label':
        case 'remove_label':
          return this.labels.map(i => {
            return {
              id: i.title,
              name: i.title,
            };
          });
        default:
          return [];
      }
    },
  },
};
