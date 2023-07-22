import { utcToZonedTime } from 'date-fns-tz';
import { isTimeAfter } from 'shared/helpers/DateHelper';

export default {
  computed: {
    channelConfig() {
      return window.chatwootWebChannel;
    },
    replyTime() {
      return window.chatwootWebChannel.replyTime;
    },
    agentNamesToDisplay() {
      // @TODO
      // 1. Need to rewrite this function. Needs to do this via i18n.
      // 2. Need to add a test for this.
      if (!this.availableAgents) return '';

      const total = this.availableAgents.length;
      const firstFew = this.availableAgents
        .slice(0, 2)
        .map(agent => agent.firstName);

      if (total > 3) {
        const names = firstFew.join(', ');
        return `${names} and ${this.availableAgents.length -
          2} others online to answer your questions.`;
      }
      if (total === 3) {
        const names = firstFew.join(', ');
        return `${names} and ${names[2]} is online to answer your questions.`;
      }
      if (total === 2) {
        const names = firstFew.join(' and ');
        return `${names} is online to answer your questions.`;
      }
      if (total === 1) {
        return `${firstFew[0]} is online to answer your questions.`;
      }
      return '';
    },
    replyTimeStatus() {
      switch (this.replyTime) {
        case 'in_a_few_minutes':
          return this.$t('REPLY_TIME.IN_A_FEW_MINUTES');
        case 'in_a_few_hours':
          return this.$t('REPLY_TIME.IN_A_FEW_HOURS');
        case 'in_a_day':
          return this.$t('REPLY_TIME.IN_A_DAY');
        default:
          return this.$t('REPLY_TIME.IN_A_FEW_HOURS');
      }
    },
    replyWaitMessage() {
      const { workingHoursEnabled } = this.channelConfig;
      if (workingHoursEnabled) {
        return this.isOnline
          ? this.replyTimeStatus
          : `${this.$t('REPLY_TIME.BACK_IN')} ${this.timeLeftToBackInOnline}`;
      }
      return this.isOnline
        ? this.replyTimeStatus
        : this.$t('TEAM_AVAILABILITY.OFFLINE');
    },
    outOfOfficeMessage() {
      return this.channelConfig.outOfOfficeMessage;
    },
    isInBetweenTheWorkingHours() {
      const {
        openHour,
        openMinute,
        closeHour,
        closeMinute,
        closedAllDay,
        openAllDay,
      } = this.currentDayAvailability;

      if (openAllDay) {
        return true;
      }

      if (closedAllDay) {
        return false;
      }

      const { utcOffset } = this.channelConfig;
      const today = this.getDateWithOffset(utcOffset);
      const currentHours = today.getHours();
      const currentMinutes = today.getMinutes();
      const isAfterStartTime = isTimeAfter(
        currentHours,
        currentMinutes,
        openHour,
        openMinute
      );
      const isBeforeEndTime = isTimeAfter(
        closeHour,
        closeMinute,
        currentHours,
        currentMinutes
      );
      return isAfterStartTime && isBeforeEndTime;
    },
    currentDayAvailability() {
      const { utcOffset } = this.channelConfig;
      const dayOfTheWeek = this.getDateWithOffset(utcOffset).getDay();
      const [workingHourConfig = {}] = this.channelConfig.workingHours.filter(
        workingHour => workingHour.day_of_week === dayOfTheWeek
      );
      return {
        closedAllDay: workingHourConfig.closed_all_day,
        openHour: workingHourConfig.open_hour,
        openMinute: workingHourConfig.open_minutes,
        closeHour: workingHourConfig.close_hour,
        closeMinute: workingHourConfig.close_minutes,
        openAllDay: workingHourConfig.open_all_day,
      };
    },
    isInBusinessHours() {
      const { workingHoursEnabled } = this.channelConfig;
      return workingHoursEnabled ? this.isInBetweenTheWorkingHours : true;
    },
    isOnline() {
      const { workingHoursEnabled } = this.channelConfig;
      const anyAgentOnline = this.availableAgents.length > 0;

      if (workingHoursEnabled) {
        return this.isInBetweenTheWorkingHours;
      }
      return anyAgentOnline;
    },
  },

  methods: {
    getDateWithOffset(utcOffset) {
      return utcToZonedTime(new Date().toISOString(), utcOffset);
    },
  },
};
