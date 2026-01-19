import * as React from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CardAction = { label: string; onClick: () => void };

export interface ActionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  primaryAction?: CardAction;
  secondaryAction?: CardAction;
  href?: string;
}

export function ActionCard({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  href,
  className,
  ...props
}: ActionCardProps) {
  const navigate = useNavigate();
  const isLink = Boolean(href);

  const handleNavigate = React.useCallback(() => {
    if (href) navigate(href);
  }, [href, navigate]);

  return (
    <Card
      className={cn(
        "transition-colors",
        isLink ? "cursor-pointer hover:bg-accent/30" : null,
        className,
      )}
      onClick={isLink ? handleNavigate : undefined}
      onKeyDown={
        isLink
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleNavigate();
              }
            }
          : undefined
      }
      role={isLink ? "link" : undefined}
      tabIndex={isLink ? 0 : undefined}
      {...props}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {icon ? (
            <div className="mt-0.5 rounded-md bg-accent p-2 text-accent-foreground">{icon}</div>
          ) : null}

          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base">{title}</CardTitle>
            {description ? <CardDescription className="mt-1">{description}</CardDescription> : null}
          </div>
        </div>
      </CardHeader>

      {primaryAction || secondaryAction ? (
        <CardFooter className="gap-2 pt-0">
          {secondaryAction ? (
            <Button
              type="button"
              variant="outline"
              onClick={(event) => {
                event.stopPropagation();
                secondaryAction.onClick();
              }}
            >
              {secondaryAction.label}
            </Button>
          ) : null}

          {primaryAction ? (
            <Button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                primaryAction.onClick();
              }}
            >
              {primaryAction.label}
            </Button>
          ) : null}
        </CardFooter>
      ) : null}
    </Card>
  );
}

