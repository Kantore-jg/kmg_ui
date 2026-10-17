<script setup>
import { UserCog, MoreHorizontal, Pencil, Trash2, Shield } from 'lucide-vue-next';
import Badge from '../ui/Badge.vue';
import Button from '../ui/Button.vue';
import Switch from '../ui/Switch.vue';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

import { sameId } from '../../../utils/ids.js';

defineProps({
  users: { type: Array, required: true },
  currentUserId: { type: [Number, String], default: null },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(['edit', 'delete', 'toggle-active']);

const roleVariant = (role) => {
  if (role === 'SUPER_ADMIN') return 'default';
  if (role === 'ADMIN_MARCHE') return 'secondary';
  if (role === 'PROPRIETAIRE_MARCHE') return 'secondary';
  if (role === 'COMMERCANT') return 'outline';
  return 'outline';
};

const initials = (name) => (name || 'U').substring(0, 2).toUpperCase();
</script>

<template>
  <div class="rounded-lg border border-border bg-card">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Utilisateur</TableHead>
          <TableHead>Rôle</TableHead>
          <TableHead>Marché assigné</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead class="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-if="loading">
          <TableCell colspan="5" class="text-center py-8 text-muted-foreground">
            Chargement...
          </TableCell>
        </TableRow>
        <TableRow v-else-if="!users.length">
          <TableCell colspan="5" class="text-center py-8 text-muted-foreground">
            Aucun utilisateur trouvé.
          </TableCell>
        </TableRow>
        <TableRow v-for="user in users" :key="user.id">
          <TableCell>
            <div class="flex items-center gap-3">
              <Avatar class="w-9 h-9">
                <AvatarImage v-if="user.avatar" :src="user.avatar" :alt="user.name" />
                <AvatarFallback class="bg-primary/10 text-primary text-xs font-semibold">
                  {{ initials(user.name) }}
                </AvatarFallback>
              </Avatar>
              <div class="min-w-0">
                <p class="font-medium text-sm truncate">{{ user.name }}</p>
                <p class="text-xs text-muted-foreground truncate">{{ user.email }}</p>
                <p v-if="user.phone" class="text-xs text-muted-foreground">{{ user.phone }}</p>
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Badge :variant="roleVariant(user.role)" class="gap-1">
              <Shield class="w-3 h-3" />
              {{ user.roleLabel }}
            </Badge>
          </TableCell>
          <TableCell>
            <span class="text-sm text-muted-foreground">
              {{ user.marketName || '—' }}
            </span>
          </TableCell>
          <TableCell>
            <div class="flex items-center gap-2">
              <Switch
                :checked="user.isActive"
                :disabled="sameId(user.id, currentUserId)"
                @update:checked="emit('toggle-active', user, $event)"
              />
              <Badge :variant="user.isActive ? 'default' : 'destructive'">
                {{ user.isActive ? 'Actif' : 'Désactivé' }}
              </Badge>
            </div>
          </TableCell>
          <TableCell class="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal class="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="emit('edit', user)">
                  <Pencil class="w-4 h-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  class="text-destructive focus:text-destructive"
                  :disabled="sameId(user.id, currentUserId)"
                  @click="emit('delete', user)"
                >
                  <Trash2 class="w-4 h-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>