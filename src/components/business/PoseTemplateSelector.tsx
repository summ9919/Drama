import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { POSE_TEMPLATES } from '../../constants/poseTemplates';
import { usePoseStore } from '../../store/poseStore';
import { colors } from '../../constants/theme';

type Props = {
  disabled?: boolean;
};

export function PoseTemplateSelector({ disabled = false }: Props) {
  let enabled = false;
  let selectedTemplateId: string | null = null;
  let toggleEnabled = () => {};
  let selectTemplate = (_id: string | null) => {};

  try {
    enabled = usePoseStore(state => state.enabled);
    selectedTemplateId = usePoseStore(state => state.selectedTemplateId);
    toggleEnabled = usePoseStore(state => state.toggleEnabled);
    selectTemplate = usePoseStore(state => state.selectTemplate);
  } catch {
    const s = usePoseStore.getState();
    enabled = s.enabled;
    selectedTemplateId = s.selectedTemplateId;
    toggleEnabled = s.toggleEnabled;
    selectTemplate = s.selectTemplate;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={disabled}
          onPress={toggleEnabled}
          style={[styles.toggleButton, enabled && styles.toggleButtonActive]}
        >
          <Ionicons
            name={enabled ? 'body' : 'body-outline'}
            size={16}
            color={enabled ? colors.ink : '#BCD3CB'}
          />
          <Text style={[styles.toggleText, enabled && styles.toggleTextActive]}>
            {enabled ? '姿势引导中' : '姿势矫正'}
          </Text>
        </TouchableOpacity>

        {enabled && (
          <Text style={styles.subtitle}>
            参照火柴人摆出好姿势
          </Text>
        )}
      </View>

      {enabled && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollList}
        >
          {POSE_TEMPLATES.map(tpl => {
            const isSelected = selectedTemplateId === tpl.id;
            return (
              <TouchableOpacity
                key={tpl.id}
                activeOpacity={0.8}
                disabled={disabled}
                onPress={() => selectTemplate(tpl.id)}
                style={[styles.templateCard, isSelected && styles.templateCardSelected]}
              >
                <Text style={styles.cardIcon}>{tpl.icon}</Text>
                <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                  {tpl.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: 4,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(39, 58, 72, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  toggleButtonActive: {
    backgroundColor: '#7FF0BE',
    borderColor: '#7FF0BE',
  },
  toggleText: {
    color: '#BCD3CB',
    fontSize: 12,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: colors.ink,
    fontWeight: '700',
  },
  subtitle: {
    color: '#8CA59C',
    fontSize: 11,
  },
  scrollList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(29, 42, 52, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  templateCardSelected: {
    backgroundColor: 'rgba(59, 122, 107, 0.65)',
    borderColor: '#7FF0BE',
  },
  cardIcon: {
    fontSize: 14,
  },
  cardTitle: {
    color: '#C6D3DC',
    fontSize: 12,
  },
  cardTitleSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
