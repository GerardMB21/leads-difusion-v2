'use client';

import type { Template } from '../types';

import { useState } from 'react';
import { IconBrandWhatsapp } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import RichTextContent from '@/components/RichTextContent';
import { api, getApiErrorMessage } from '@/lib/api';
import SendWhatsAppDialog from './SendWhatsAppDialog';
import TemplateActions from './TemplateActions';
import { toast } from '@/components/ui/toast';

const SEND_TIMEOUT = 60_000;

const TemplateCard = ({ template }: { template: Template }) => {
  const [sendOpen, setSendOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const onSend = async (phone: string) => {
    setSending(true);
    try {
      await api.post(
        '/whatsapp/send',
        { phone, templateId: template.id },
        { timeout: SEND_TIMEOUT },
      );

      toast.add({
        title: 'Mensaje enviado',
        description: `El template ${template.name} se ha enviado al numero ${phone}.`,
      });
    } catch (error) {
      toast.add({
        title: 'Error al enviar mensaje',
        description: getApiErrorMessage(error, 'No se pudo enviar el mensaje'),
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <article className="flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground">
      <header className="flex items-center justify-between gap-2">
        <h3 className="truncate font-medium">{template.name}</h3>
        <TemplateActions template={template} />
      </header>
      {template.img && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={template.img}
          alt={template.name}
          loading="lazy"
          className="h-32 w-full rounded-md object-cover"
        />
      )}
      <RichTextContent html={template.message} className="line-clamp-5 text-sm" />
      <footer className="mt-auto">
        <Button
          className="w-full bg-[#25D366] text-white hover:bg-[#1ebe5a]"
          onClick={() => setSendOpen(true)}
          disabled={sending}
        >
          <IconBrandWhatsapp />
          {sending ? 'Enviando...' : 'Enviar'}
        </Button>
      </footer>
      <SendWhatsAppDialog
        template={template}
        open={sendOpen}
        onOpenChange={setSendOpen}
        onSend={onSend}
      />
    </article>
  );
};

export default TemplateCard;
