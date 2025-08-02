use rodio::{cpal::FromSample, Sample, Source};
use std::time::Duration;
use tauri::AppHandle;

pub struct SourceWithFn<S, F>(S, Option<F>);

impl<S, F> Iterator for SourceWithFn<S, F>
where
    S: Source,
    S::Item: FromSample<S::Item>,
    F: FnOnce(),
{
    type Item = S::Item;

    fn next(&mut self) -> Option<S::Item> {
        match self.0.next() {
            Some(sample) => Some(sample),
            None => {
                if let Some(f) = self.1.take() {
                    f();
                }
                None
            }
        }
    }

    fn size_hint(&self) -> (usize, Option<usize>) {
        self.0.size_hint()
    }
}

impl<S, F> Source for SourceWithFn<S, F>
where
    S: Source,
    S::Item: FromSample<S::Item>,
    F: FnOnce(),
{
    fn current_span_len(&self) -> Option<usize> {
        self.0.current_span_len()
    }

    fn channels(&self) -> u16 {
        self.0.channels()
    }

    fn sample_rate(&self) -> u32 {
        self.0.sample_rate()
    }

    fn total_duration(&self) -> Option<Duration> {
        self.0.total_duration()
    }

    fn try_seek(&mut self, pos: Duration) -> Result<(), rodio::source::SeekError> {
        self.0.try_seek(pos)
    }
}

impl<S, F> SourceWithFn<S, F>
where
    S: Source,
    S::Item: FromSample<S::Item>,
    F: FnOnce(),
{
    pub fn wrap(source: S, f: F) -> Self {
        Self(source, Some(f))
    }
}