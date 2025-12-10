
"use client";

import { useState, useContext } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageIcon, User } from 'lucide-react';
import { UserContext } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export function ProfilePictureChanger() {
  const { currentUser, updateUser } = useContext(UserContext);
  const [isOpen, setIsOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!imagePreview || !currentUser) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se ha seleccionado ninguna imagen."
        });
        return;
    }

    updateUser(currentUser.email, { profilePictureUrl: imagePreview });
    toast({
        title: "Foto de perfil actualizada",
        description: "Tu nueva foto de perfil ha sido guardada.",
    });

    setIsOpen(false);
    setImagePreview(null);
    setImageFile(null);
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset state when closing the dialog
      setImagePreview(null);
      setImageFile(null);
    }
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <User className="mr-2 h-4 w-4" />
          <span>Cambiar Foto</span>
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar Foto de Perfil</DialogTitle>
          <DialogDescription>
            Selecciona una nueva imagen para tu perfil. La imagen se guardará y actualizará en tiempo real.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex justify-center">
            <div className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-dashed flex items-center justify-center bg-muted">
              {imagePreview ? (
                <Image src={imagePreview} alt="Vista previa" layout="fill" objectFit="cover" />
              ) : currentUser?.profilePictureUrl ? (
                <Image src={currentUser.profilePictureUrl} alt="Foto actual" layout="fill" objectFit="cover" />
              ) : (
                <ImageIcon className="h-16 w-16 text-muted-foreground" />
              )}
            </div>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5 mx-auto">
            <Label htmlFor="picture">Seleccionar imagen</Label>
            <Input id="picture" type="file" accept="image/png, image/jpeg, image/gif" onChange={handleFileChange} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={!imagePreview}>Guardar Foto</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
