'use client';

import type { LeadRow } from '@/app/leads/types';
import type { Template } from '../types';

import { useEffect, useState } from 'react';
import { IconBrandWhatsapp } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { api, getApiErrorMessage } from '@/lib/api';

type Option = { value: string; label: string };

interface Props {
  template: Template;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (phone: string) => void;
}

interface FormProps {
  template: Template;
  onClose: () => void;
  onSend: (phone: string) => void;
}

const SendForm = ({ template, onClose, onSend }: FormProps) => {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [selected, setSelected] = useState<Option | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    api
      .get<LeadRow[]>('/leads')
      .then(({ data }) => active && setLeads(data))
      .catch((e) => active && setError(getApiErrorMessage(e, 'No se pudieron cargar los leads')))
      .finally(() => active && setLoadingLeads(false));

    return () => {
      active = false;
    };
  }, []);

  const query = inputValue.trim().toLowerCase();
  const queryDigits = query.replace(/\D/g, '');

  const options: Option[] = leads
    .filter(
      ({ contactName, phone }) =>
        !query ||
        contactName.toLowerCase().includes(query) ||
        (queryDigits !== '' && phone.replace(/\D/g, '').includes(queryDigits)),
    )
    .map(({ contactName, phone }) => ({ value: phone, label: `${contactName} · ${phone}` }));

  const isPhone = /^\+?[\d\s()-]{7,}$/.test(inputValue.trim());
  const isRegistered = leads.some(({ phone }) => phone.replace(/\D/g, '') === queryDigits);

  if (isPhone && !isRegistered) {
    const phone = inputValue.trim();

    options.push({ value: phone, label: `Usar número ${phone}` });
  }

  const onSubmit = () => {
    if (!selected) return;

    onSend(selected.value);
    onClose();
  };

  return (
    <>
      <Field>
        <FieldLabel htmlFor={`send-wa-${template.id}`}>Destinatario</FieldLabel>
        <Combobox
          autoHighlight
          filter={null}
          items={options}
          value={selected}
          inputValue={inputValue}
          onInputValueChange={setInputValue}
          onValueChange={setSelected}
        >
          <ComboboxInput
            id={`send-wa-${template.id}`}
            placeholder={loadingLeads ? 'Cargando leads...' : 'Busca por nombre o teléfono'}
          />
          <ComboboxContent>
            <ComboboxEmpty>Sin resultados. Escribe un número para usarlo.</ComboboxEmpty>
            <ComboboxList>
              {(item: Option) => (
                <ComboboxItem key={item.value} value={item}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <FieldDescription>
          También puedes escribir un número que no esté registrado.
        </FieldDescription>
      </Field>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!selected}
          className="bg-[#25D366] text-white hover:bg-[#1ebe5a]"
        >
          <IconBrandWhatsapp />
          Enviar
        </Button>
      </DialogFooter>
    </>
  );
};

const SendWhatsAppDialog = ({ template, open, onOpenChange, onSend }: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Enviar por WhatsApp</DialogTitle>
        <DialogDescription>
          Envía el template {template.name} a un lead o a un número nuevo.
        </DialogDescription>
      </DialogHeader>
      <SendForm template={template} onClose={() => onOpenChange(false)} onSend={onSend} />
    </DialogContent>
  </Dialog>
);

export default SendWhatsAppDialog;
