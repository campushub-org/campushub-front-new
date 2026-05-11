import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookCopy, AlertTriangle, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const QuickInfoWidget: React.FC = () => {
  const { t } = useTranslation();

  const infoItems = [
    {
      icon: <BookCopy className="h-6 w-6 text-blue-500" />,
      label: t("student.quick_view.new_materials"),
      value: '3',
    },
    {
      icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
      label: t("student.quick_view.next_exam"),
      value: t("student.quick_view.days_left", { count: 5 }),
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-green-500" />,
      label: t("student.quick_view.unread_messages"),
      value: '2',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("student.quick_view.title")}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {infoItems.map((item) => (
          <div key={item.label} className="flex items-center space-x-4 rounded-md border p-4">
            {item.icon}
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">{item.label}</p>
              <p className="text-sm text-muted-foreground">{item.value}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default QuickInfoWidget;
