import React from "react";
import { Notification } from "@mantine/core";
import { IconHome2, IconSchool } from "@tabler/icons-react";
import { UIFeedbackType } from "@/types/UIFeedbackTypes";
import s from "./NotificationBadges.module.css";

const notificationType: Record<UIFeedbackType, Record<any, any>> = {
  error: {
    color: "red",
  },
  success: {
    color: "green",
  },
  warning: {
    color: "yellow",
  },
};

type badgeContexts = "classroom" | "teacher";

const notificationIconContext: Record<badgeContexts, any> = {
  classroom: <IconHome2 />,
  teacher: <IconSchool />,
};

interface Props {
  message: string;
  type: UIFeedbackType;
  context: badgeContexts;
}

const NotificationCard: React.FC<Props> = ({ message, type, context }) => {
  return (
    <Notification
    styles={{ root: { width: "100%" } }}
      color={notificationType[type].color}
      icon={notificationIconContext[context]}
      withCloseButton={false}
    >
      {message}
    </Notification>
  );
};

export default NotificationCard;
