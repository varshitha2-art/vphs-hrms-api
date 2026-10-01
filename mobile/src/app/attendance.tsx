import React, { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  AttendanceRecord,
  getTodayAttendance,
  punchIn,
  punchOut,
} from '@/services/api';

export default function AttendanceScreen() {
  const [attendance, setAttendance] =
    useState<AttendanceRecord | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [punchingIn, setPunchingIn] =
    useState(false);

  useEffect(() => {
    loadAttendance();
  }, []);

  async function loadAttendance() {
    setLoading(true);
    setError(null);

    const result = await getTodayAttendance();

    if (result.success) {
      setAttendance(result.attendance);
    } else {
      setError(
        result.error || 'Unable to load attendance.',
      );
    }

    setLoading(false);
  }
   async function handlePunchOut() {
  try {
    setError(null);

    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      setError(
        'Location permission is required to punch out.',
      );
      return;
    }

    const location =
      await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

    const latitude = location.coords.latitude;
    const longitude = location.coords.longitude;

    console.log(
      '[Attendance] Punch Out GPS:',
      latitude,
      longitude,
    );

    const result = await punchOut(
      latitude,
      longitude,
    );

    if (!result.success) {
      setError(
        result.error ||
          'Punch Out was not accepted.',
      );
      return;
    }

    setAttendance(result.attendance);

    console.log(
      '[Attendance] Punch Out successful',
    );
  } catch (error) {
    console.error(
      '[Attendance] Punch Out error:',
      error,
    );

    setError(
      'Unable to get your current location. Please try again.',
    );
  }
}
  async function handlePunchIn() {
    try {
      setPunchingIn(true);
      setError(null);

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setError(
          'Location permission is required to punch in.',
        );
        return;
      }

      const location =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      const latitude = location.coords.latitude;
      const longitude = location.coords.longitude;

      console.log(
        '[Attendance] GPS:',
        latitude,
        longitude,
      );

      const result = await punchIn(
        latitude,
        longitude,
      );

      if (!result.success) {
        setError(
          result.error ||
            'Punch In was not accepted.',
        );
        return;
      }

      setAttendance(result.attendance);

      console.log(
        '[Attendance] Punch In successful',
      );
    } catch (error) {
      console.error(
        '[Attendance] Punch In error:',
        error,
      );

      setError(
        'Unable to get your current location. Please try again.',
      );
    } finally {
      setPunchingIn(false);
    }
  }

  const today = new Date().toLocaleDateString();

  const status =
    attendance?.status || 'NOT MARKED';

  const checkIn = attendance?.inTime
    ? new Date(
        attendance.inTime,
      ).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--:--';

  const checkOut = attendance?.outTime
    ? new Date(
        attendance.outTime,
      ).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--:--';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>
          Attendance
        </Text>

        <Text style={styles.subtitle}>
          VPHS HRMS Attendance
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Today's Attendance
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>
              Date
            </Text>

            <Text style={styles.value}>
              {today}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Status
            </Text>

            <Text
              style={
                status === 'PRESENT'
                  ? styles.present
                  : styles.status
              }
            >
              {loading
                ? 'Loading...'
                : status}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Check In
            </Text>

            <Text style={styles.value}>
              {loading ? '...' : checkIn}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Check Out
            </Text>

            <Text style={styles.value}>
              {loading ? '...' : checkOut}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.punchInButton,
              punchingIn &&
                styles.punchInButtonDisabled,
            ]}
            onPress={handlePunchIn}
            disabled={punchingIn}
          >
            <Text style={styles.punchInButtonText}>
              {punchingIn
                ? 'GETTING LOCATION...'
                : 'PUNCH IN'}
            </Text>
          </TouchableOpacity>
<TouchableOpacity
  style={[
    styles.punchOutButton,
    (!attendance?.inTime || !!attendance?.outTime) &&
      styles.punchOutButtonDisabled,
  ]}
  onPress={handlePunchOut}
  disabled={!attendance?.inTime || !!attendance?.outTime}
>
  <Text style={styles.punchOutButtonText}>
    {attendance?.outTime
      ? 'PUNCHED OUT'
      : !attendance?.inTime
        ? 'PUNCH IN FIRST'
        : 'PUNCH OUT'}
  </Text>
</TouchableOpacity>

          {error && (
            <Text style={styles.error}>
              {error}
            </Text>
          )}

          {!loading &&
            !error &&
            !attendance && (
              <Text style={styles.info}>
                No attendance has been marked
                for today.
              </Text>
            )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Attendance Summary
          </Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryBox}>
              <Text
                style={styles.summaryNumber}
              >
                {attendance?.status ===
                  'PRESENT' ||
                attendance?.status === 'LATE'
                  ? '1'
                  : '0'}
              </Text>

              <Text style={styles.summaryLabel}>
                Present
              </Text>
            </View>

            <View style={styles.summaryBox}>
              <Text
                style={styles.summaryNumber}
              >
                {attendance?.status ===
                'ABSENT'
                  ? '1'
                  : '0'}
              </Text>

              <Text style={styles.summaryLabel}>
                Absent
              </Text>
            </View>

            <View style={styles.summaryBox}>
              <Text
                style={styles.summaryNumber}
              >
                {attendance?.status === 'LEAVE'
                  ? '1'
                  : '0'}
              </Text>

              <Text style={styles.summaryLabel}>
                Leave
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  container: {
    padding: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
  },

  subtitle: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 5,
    marginBottom: 24,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 18,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  label: {
    fontSize: 15,
    color: '#64748B',
  },

  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },

  present: {
    fontSize: 15,
    fontWeight: '700',
    color: '#16A34A',
  },

  status: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },

  punchInButton: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },

  punchOutButton: {
  backgroundColor: '#DC2626',
  borderRadius: 12,
  paddingVertical: 16,
  alignItems: 'center',
  marginTop: 12,
},

punchOutButtonText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: '800',
},

punchOutButtonDisabled: {
  opacity: 0.5,
},

  punchInButtonDisabled: {
    opacity: 0.6,
  },

  
  punchInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  error: {
    marginTop: 16,
    color: '#DC2626',
    fontSize: 14,
  },

  info: {
    marginTop: 16,
    color: '#64748B',
    fontSize: 14,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  summaryBox: {
    width: '30%',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },

  summaryNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },

  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
});

